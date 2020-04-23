# vuetron

Electron boilerplate for Vue applications based on [electron-vue](https://github.com/SimulatedGREG/electron-vue). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

## Migrating your Vue app

- Copy the `src/` folder and the `main.js` file of your Vue app to `src/renderer/`, overwrite existing `main.js` if necessary
- If needed, install the dependencies from yor Vue app
- If you need to tweak the webpack configuration for your vue app, you can do so in `.electron-vue/webpack.renderer.config.js`
- If you need electron integration in the renderer, add the following line to your `main.js`:
```javascript
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
```
- Test the app with `npm run dev`
