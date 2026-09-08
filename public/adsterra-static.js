(function loadResponsiveBanner() {
  // The parent chooses the format before the iframe's viewport is laid out.
  var frameFormat = window.location.pathname.endsWith('/adsterra-frame.html')
    ? new URLSearchParams(window.location.search).get('formato')
    : null
  var mobile = frameFormat === 'mobile' || (frameFormat !== 'desktop' && window.matchMedia('(max-width: 600px)').matches)
  window.atOptions = mobile
    ? { key: 'd1385a1841db6074b34f310da3b70a9d', format: 'iframe', height: 50, width: 320, params: {} }
    : { key: 'a7a339e0dd5f5bab6b60562ae8566a9a', format: 'iframe', height: 90, width: 728, params: {} }
  var source = mobile
    ? 'https://www.highrevenueformat.com/d1385a1841db6074b34f310da3b70a9d/invoke.js'
    : 'https://www.highrevenueformat.com/a7a339e0dd5f5bab6b60562ae8566a9a/invoke.js'
  document.write('<script src="' + source + '"><\/script>')
})()
