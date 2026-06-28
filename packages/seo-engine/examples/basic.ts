import { SeoEngine } from '../src/engine/seo-engine.js';

const html = `
<html>
<head>
<title>SEO Checker Example</title>

<meta
  name="description"
  content="This is a test description for SEO checker."
/>
</head>

<body>
<h1>Hello World</h1>
</body>
</html>
`;

const engine = new SeoEngine()

async function run() {
  const report =
    await engine.analyze(
      'https://example.com',
      html
    );

  console.log(
    JSON.stringify(
      report,
      null,
      2
    )
  );
}

run();