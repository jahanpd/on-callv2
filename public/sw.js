if(!self.define){let e,s={};const n=(n,c)=>(n=new URL(n+".js",c).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(c,a)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let i={};const r=e=>n(e,t),o={module:{uri:t},exports:i,require:r};s[t]=Promise.all(c.map((e=>o[e]||r(e)))).then((e=>(a(...e),i)))}}define(["./workbox-588899ac"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/88fEmI_g0fMBH8YYMZCV1/_buildManifest.js",revision:"f5a4fc9d16a7322d1162c5f2dc4f53bd"},{url:"/_next/static/88fEmI_g0fMBH8YYMZCV1/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/354-9d02c83e68597036.js",revision:"9d02c83e68597036"},{url:"/_next/static/chunks/366-eb9b7f490bdad60a.js",revision:"eb9b7f490bdad60a"},{url:"/_next/static/chunks/375-e5a3f6630afd843b.js",revision:"e5a3f6630afd843b"},{url:"/_next/static/chunks/39-2b6de30091914c01.js",revision:"2b6de30091914c01"},{url:"/_next/static/chunks/424-4c60dd045a9cd86b.js",revision:"4c60dd045a9cd86b"},{url:"/_next/static/chunks/586-61470e5a7d56b4f6.js",revision:"61470e5a7d56b4f6"},{url:"/_next/static/chunks/636.13967091027d313a.js",revision:"13967091027d313a"},{url:"/_next/static/chunks/72a30a16.126655e5b8af5fd0.js",revision:"126655e5b8af5fd0"},{url:"/_next/static/chunks/856.f9586a82b823ca7c.js",revision:"f9586a82b823ca7c"},{url:"/_next/static/chunks/ad7f724d.fe3c50b7e88bf9d8.js",revision:"fe3c50b7e88bf9d8"},{url:"/_next/static/chunks/e78312c5-47716bcbdddd62bf.js",revision:"47716bcbdddd62bf"},{url:"/_next/static/chunks/framework-50116e63224baba2.js",revision:"50116e63224baba2"},{url:"/_next/static/chunks/main-02ee4249ae5f6996.js",revision:"02ee4249ae5f6996"},{url:"/_next/static/chunks/pages/_app-c8d0615c33f6ea3e.js",revision:"c8d0615c33f6ea3e"},{url:"/_next/static/chunks/pages/_error-409f831d3504c8f5.js",revision:"409f831d3504c8f5"},{url:"/_next/static/chunks/pages/account-44f32c381f7c7acb.js",revision:"44f32c381f7c7acb"},{url:"/_next/static/chunks/pages/auth-742c0066e0589b67.js",revision:"742c0066e0589b67"},{url:"/_next/static/chunks/pages/home-67bee78af48dcd9a.js",revision:"67bee78af48dcd9a"},{url:"/_next/static/chunks/pages/index-21e8f3120754e570.js",revision:"21e8f3120754e570"},{url:"/_next/static/chunks/pages/landing-4de5520d72491151.js",revision:"4de5520d72491151"},{url:"/_next/static/chunks/pages/logout-216010390b9b9ca1.js",revision:"216010390b9b9ca1"},{url:"/_next/static/chunks/pages/notes-e009bdd3c28ecab2.js",revision:"e009bdd3c28ecab2"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-fab9ffb580e0714e.js",revision:"fab9ffb580e0714e"},{url:"/_next/static/css/72cf04e03ffcbe08.css",revision:"72cf04e03ffcbe08"},{url:"/_next/static/css/a7e9f22b63e2731b.css",revision:"a7e9f22b63e2731b"},{url:"/android-chrome-192x192.png",revision:"0722bc44c3132dbb03f6f41cc0c54a80"},{url:"/android-chrome-512x512.png",revision:"a980c47c6646358973f9589e27faa944"},{url:"/apple-touch-icon.png",revision:"b10533c862a11587c3b0b09e0c655ced"},{url:"/favicon-16x16.png",revision:"481007b248284ab04c334fe73d9fab4c"},{url:"/favicon-32x32.png",revision:"f9b31aee2792624f43083c9e2164b3f4"},{url:"/favicon.ico",revision:"14ec9f8cde188c36859275246b34d00e"},{url:"/manifest.json",revision:"7a57cd44b6bea6e94c4e7041ee07ffb0"},{url:"/site.webmanifest",revision:"053100cb84a50d2ae7f5492f7dd7f25e"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:c})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
