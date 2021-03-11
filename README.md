# Game: Select Theme

"Game: Select Theme" (or "GST"),
allow user to select correct theme of template,
base on cover images.

* Configurable
* Pre-load images
* Tutorial
* Auto countdown
* Level select
* Notify parent window

## Basic

### Install

Upload everything to your server, eg.:

```text
//sample.com/gst/
```

### Usage

Embed `iframe.html` into your page, eg.:

```html
<iframe src="//sample.com/gst/iframe.html" frameborder="0" width="730" height="510"></iframe>
```

## Advanced

### Setup

GST uses config file to setup everything.
Look into the default `config.json` in `asset` folder for details.
You can also pass your own config file to `iframe`, eg.:

```html
<iframe src="//sample.com/gst/iframe.html?config=my-themes.json"></iframe>
```

### Templates

GST uses `templates.json` to store data.
You can easily convert a data-sheet into `json` with [Mr. Data Converter](https://shancarter.github.io/mr-data-converter/)

### Notices

If GST is loaded as iframe,
it will notify parent window by `[window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)`,
when each round of game is finished,
and when user want to see detail of rules.

```javascript
// with native
window.addEventListener('message', function(e) {
  if (e.data.from === 'gst') {
    console.log(e.data.action)
    console.log(e.data.data)
  }
}, false)
```

```javascript
// with jquery
$(window).on('message', function (e) {
  if (e.originalEvent.data.from === 'gst') {
    console.log(e.originalEvent.data.action)
    console.log(e.originalEvent.data.data)
  }
})
```

## Extra

### Vendor

* [axios](https://github.com/axios/axios)
* [bootstrap reboot](https://github.com/twbs/bootstrap)
* [ES6-Promise](https://github.com/stefanpenner/es6-promise)
* [Lodash](https://github.com/lodash/lodash)
* [Vue](https://github.com/vuejs/vue)
* [vue-axios](https://github.com/imcvampire/vue-axios)
* [Web Font Loader](https://github.com/typekit/webfontloader)

### Linter

* HTML: [HTMLHint](https://github.com/yaniswang/HTMLHint)
* CSS: [CSSLint](https://github.com/CSSLint/csslint)
* JavaScript: [standard](https://github.com/standard/standard)

### Change Log

```text
210311
+ update vendors

180817
+ add tutorial

180816
+ initial release
