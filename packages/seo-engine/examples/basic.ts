import { SeoEngine } from '../src/engine/seo-engine.js';

import { TitleExistsRule } from '../src/rules/title-exists.rule.js';
import { TitleLengthRule } from '../src/rules/title-length.rule.js';
import { MetaDescriptionExistsRule } from '../src/rules/meta-description-exists.rule.js';
import { MetaDescriptionLengthRule } from '../src/rules/meta-description-length.rule.js';
import { H1ExistsRule } from '../src/rules/h1-exists.rule.js';
import { CanonicalRule } from '../src/rules/canonical.rule.js';

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

const engine = new SeoEngine([
  new TitleExistsRule(),
  new TitleLengthRule(),
  new MetaDescriptionExistsRule(),
  new MetaDescriptionLengthRule(),
  new H1ExistsRule(),
  new CanonicalRule(),
]);

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