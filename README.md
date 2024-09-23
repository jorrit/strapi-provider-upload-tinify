# Strapi upload provider to minify images using the Tinify API

The Tinify API minifies PNG, JPEG and WebP images. This upload provider passes uploaded
images through this API and then uses an underlying provider (such as S3) to store the
result. Tinify does not store the images.

## Supported Strapi versions

- v4.x.x

## Installation

```sh
npm install strapi-provider-upload-tinify
```

**or**

```sh
yarn add strapi-provider-upload-tinify
```

Request an API key at https://tinypng.com/developers.

Add the following to your `config/plugins.js` or `config/plugins.ts` file.
Move existing provider options to the `upstream` property of the `tinify`
configuration.

```js
  upload: {
    config: {
      provider: 'strapi-provider-upload-tinify',
      providerOptions: {
        apiKey: 'YOUR API KEY',
        upstream: {
          provider: 'aws-s3',
          providerOptions: {
            s3Options: {
              credentials: {
                accessKeyId: env('AWS_USERNAME'),
                secretAccessKey: env('AWS_PASSWORD'),
              },
              params: {
                Bucket: env('AWS_S3BUCKET'),
              },
            }
          }
        },
      },
    }
  },
```
