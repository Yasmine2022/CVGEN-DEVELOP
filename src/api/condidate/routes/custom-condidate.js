module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/condidate/upload-cv',
        handler: 'condidate.uploadCv',
        config: {
          auth: false,
        },
      },
    ],
  };