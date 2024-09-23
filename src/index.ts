import { TinifyOptions, UploadProvider } from './types';

import { createProvider } from './upstreamProvider';
import { file as fileUtils } from '@strapi/utils';
import type {} from '@strapi/types';
import tinify from 'tinify';

const provider: UploadProvider<TinifyOptions> = {
  init(providerOptions) {
    if (!providerOptions.apiKey) {
      throw new Error('Required tinify provider option apiKey is missing');
    }

    tinify.key = providerOptions.apiKey;

    const upstreamProvider = createProvider(providerOptions.upstream);
    const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    return {
      async upload(file, customParams) {
        if (!supportedMimeTypes.includes(file.mime)) {
          return upstreamProvider.upload(file, customParams);
        }

        try {
          const resultData = await tinify.fromBuffer(file.buffer).toBuffer();

          file.buffer = resultData;
          file.size = fileUtils.bytesToKbytes(resultData.length);

          return upstreamProvider.upload(file);
        } catch (err) {
          strapi.log.error('tinify failed for ' + file.name, err);
          throw err;
        }
      },

      delete(file, customParams) {
        strapi.log.info('tinify delete', { ...file, buffer: '' });
        return upstreamProvider.delete(file, customParams);
      },

      isPrivate() {
        return 'isPrivate' in upstreamProvider && upstreamProvider.isPrivate();
      },

      getSignedUrl(file, customParams) {
        return upstreamProvider.getSignedUrl(file, customParams);
      },

      checkFileSize(file, options) {
        return upstreamProvider.checkFileSize(file, options);
      }
    };
  },
};

export default provider;
