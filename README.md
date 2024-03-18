# Land Use Demonstrator Web App

Web app for visualisation of modelling and results from the Land Use Demonstrator project. See:

- [The Geospatial Commission's blog post](https://www.landusedialogues.gov.uk/2023/03/13/using-spatial-data-science-to-deliver-more-from-the-same-land/) about the project
- [A page on the Alan Turing Institute's intranet, Mathison](https://mathison.turing.ac.uk/page/2864), about the project.


## View online

**https://Urban-Analytics-Technology-Platform.github.io/demoland-web**

The `dev` branch can be previewed at https://Urban-Analytics-Technology-Platform.github.io/demoland-web/dev.
(This is not guaranteed to always be functional!)


## Running locally

The easiest way is probably using Docker:

```
git clone git@github.com:Urban-Analytics-Technology-Platform/demoland-web.git
cd demoland-web
docker build -t demoland_web .
docker run -p 80:80 demoland_web
```

Then, navigate to http://localhost in your browser.


## Local development

**npm run dev**

For rapid prototyping and feature development, it's recommended to use Vite:

```
git clone git@github.com:Urban-Analytics-Technology-Platform/demoland-web.git
cd demoland-web
npm install
npm run dev   # this invokes Vite
```

Note that `npm run dev` only allows you to set up the app for one area at a time.
Without any arguments, the default area of `tyne_and_wear` will be used.
You can specify which area to work on by running `npm run dev [AREA_NAME]`.
The valid values for `[AREA_NAME]` are the subdirectories of the `/areas` folder.

Vite's HMR functionality means that the website you see is updated any time any of the files change.
However, note that if you change files inside the `/areas` folder (e.g. by adding a new scenario), it will not reload automatically: you will have to restart the server to see the changes live.

**npm run build**

To build the project for one specific area, use:

```
npm run build local [AREA_NAME]
```

(again, if unspecified, `[AREA_NAME]` defaults to `tyne_and_wear`.)
The build output is placed inside `/dist`. You can then run

```
npm run preview
```

to launch a HTTP server from this directory on port 4173.
You can then open http://localhost:4173/[AREA_NAME] in your browser.

Note that the build procedure is set up such that the website root (i.e. http://localhost:4173) redirects to the default area, i.e. http://localhost:4173/tyne_and_wear.
If you have not built the files for `tyne_and_wear` before then this will give you a 404 error, which can be fixed by running `npm run build local tyne_and_wear`.

**npm run build_all**

To build the files for all areas at once (which is probably the more helpful option, unless you're specifically debugging issues with one area), use:

```
npm run build_all local
```

You can then again use `npm run preview`, like above.

## Spinning up a new, customised copy of DemoLand

See `CUSTOM_AREA.md`.


## Related repositories

This web app is powered by two other repositories:

- [demoland-project](https://github.com/Urban-Analytics-Technology-Platform/demoland-project) contains the modelling work which is responsible for the predicted indicator values, as well as a book discussing the project methodology and developer notes for the web app.
- [demoland-engine](https://github.com/Urban-Analytics-Technology-Platform/demoland-engine) is a self-contained package which hosts the final trained models, as well as a REST API which is used for the custom scenario prediction backend.
