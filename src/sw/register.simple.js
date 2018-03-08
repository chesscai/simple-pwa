if (navigator.serviceWorker) {
  navigator.serviceWorker.register('./sw.js')
    .then(function (registration) {
      console.log('Registered events at scope: ', registration)
    })
    .catch(function (err) {
      console.log('ServiceWorker registration failed: ', err)
    })
}