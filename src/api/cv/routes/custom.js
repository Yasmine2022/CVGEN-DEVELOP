module.exports= {
  routes: [
    {
      "method": "GET",
      "path": "/print-cv/:id",
      "handler": "cv.printCv",
      "config": {
        "auth": false
      }
    },
  ]
}