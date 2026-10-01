# fanfou-export

Export all your Fanfou statuses

<div align="center"><img src="https://raw.githubusercontent.com/LitoMore/fanfou-export/master/media/screenshot.png" /></div>

## Development

Requires Node.js 22.13+ or 24+. Built with Vite, TypeScript and React.

```sh
npm ci
npm run dev
```

`npm start` also starts the development server. Run `npm run lint` to check
code with XO and its React rules, or `npm run lint:fix` to fix issues and format
with Prettier. Run `npm run typecheck` for strict type checking, and
`npm run build` to type-check and create a production build in `dist/`.
Use `npm run preview` to preview that build locally.

The app uses `fanfou-sdk@beta` in the browser. Responses are converted to the
previous export format, including snake_case fields and nested reposts.
Run `npm test` for export compatibility checks using Node.js's built-in test runner.

## Deployment

`npm run deploy` builds the app and publishes `dist/` to GitHub Pages.
`public/CNAME` preserves the custom domain, `export.fanfou.pro`.

## Related

- [fanfou-sdk](https://github.com/fanfoujs/fanfou-sdk-node) - API for this tool

## License

MIT
