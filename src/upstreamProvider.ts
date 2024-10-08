// Copied from packages/core/upload/server/register.js

import { errors as errorUtils, file as fileUtils } from '@strapi/utils';
import { toLower, mapValues } from 'lodash';
import type { UploadProvider, UploadProviderInstance, UpstreamProviderConfiguration } from './types';

const createProvider = (config: UpstreamProviderConfiguration): UploadProviderInstance => {
  const { providerOptions, actionOptions = {} } = config;

  const providerName = toLower(config.provider);
  let provider: UploadProvider<unknown>;

  let modulePath: string;
  try {
    modulePath = require.resolve(`@strapi/provider-upload-${providerName}`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    provider = require(modulePath);
  } catch (err) {
    const newError = new Error(`Could not load upload provider "${providerName}".`);
    newError.stack = err.stack;
    throw newError;
  }

  const providerInstance = provider.init(providerOptions);

  if (!providerInstance.delete) {
    throw new Error(`The upload provider "${providerName}" doesn't implement the delete method.`);
  }

  if (!providerInstance.upload && !providerInstance.uploadStream) {
    throw new Error(
      `The upload provider "${providerName}" doesn't implement the uploadStream nor the upload method.`
    );
  }

  if (!providerInstance.uploadStream) {
    process.emitWarning(
      `The upload provider "${providerName}" doesn't implement the uploadStream function. Strapi will fallback on the upload method. Some performance issues may occur.`
    );
  }

  const wrappedProvider = mapValues(providerInstance, (method, methodName) => {
    return async (file, options = actionOptions[methodName]) =>
      providerInstance[methodName](file, options);
  });

  return Object.assign(Object.create(baseProvider), wrappedProvider);
};

const baseProvider = {
  extend(obj) {
    Object.assign(this, obj);
  },
  checkFileSize(file, { sizeLimit }) {
    if (sizeLimit && fileUtils.kbytesToBytes(file.size) > sizeLimit) {
      throw new errorUtils.PayloadTooLargeError(
        `${file.name} exceeds size limit of ${fileUtils.bytesToHumanReadable(sizeLimit)}.`
      );
    }
  },
  getSignedUrl(file: File) {
    return file;
  },
  isPrivate() {
    return false;
  },
};

export { createProvider };
