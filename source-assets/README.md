# Image sources and credits

The files in this folder are source material for the website. They are outside
`public`, so Vite does not include them in the deployed site. Run
`node scripts/optimize-images.mjs` from the project root to rebuild the
responsive WebP and SVG files in `public/assets/media`.

- `original-public/` preserves the original Figma and earlier site exports.
- `commons/flag-of-bhutan.svg`: [Flag of Bhutan](https://commons.wikimedia.org/wiki/File:Flag_of_Bhutan.svg), public domain.
- `commons/punakha-dzong.jpg`: [Punakha Dzong, Bhutan](https://commons.wikimedia.org/wiki/File:Punakha_Dzong,_Bhutan_01.jpg), Bernard Gagnon, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The gallery displays a resized WebP version.
- `commons/bhutanese-mother-and-daughter.jpg`: [Bhutanese mother and daughter](https://commons.wikimedia.org/wiki/File:Bhutanese_mother_and_daughter.jpg), Christopher J. Fynn, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The gallery displays a square crop resized as WebP.

The gallery images retain creator and license details in their title metadata.
