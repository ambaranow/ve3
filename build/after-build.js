const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

let src = path.join('src');
let destDir = path.join('dist');

const assets = 'assets';
const locales = require(path.join('./..', src, assets, 'locales.json'))
 
const defaultLocale = 'en';

function parseFileName(n) {
  // console.log('parseFileName ' + n)
  const re = /(.+)\.([0-9a-z]{1,5})$/i;
  return {name: (n.match(re)[1]), ext: (n.match(re)[2])};
}

/*
 * Получаем файлы index.html и очищаем от лишних тэгов
 */
glob(destDir + '/**/index.html', null, function (er, files) {
  files.forEach((file) => {
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      let $ = cheerio.load(data, {decodeEntities: false});
      $ = cheerio.load($('html').html());
      locales.locales.forEach(lang => {
        const locale = JSON.parse(fs.readFileSync(path.join(src, assets, 'locale', lang + '.json'), 'utf8'));
        let roothtml = '';
        for (const key in locale.GREETING) {
          if (locale.GREETING.hasOwnProperty(key)) {
            roothtml += '\n  <p><strong>' + locale.GREETING[key].TITLE + '</strong></p>';
            roothtml += '\n  <p>' + locale.GREETING[key].TEXT + '</p>';
          }
        }
        roothtml += `\n  <p>`;
        roothtml += `${locale.NOSCRIPT} `;
        roothtml += `<a href="/${lang}/video">${locale.GREETINGBUTTONS.TRYNOW}</a></p>\n  `;
        $('noscript').html(roothtml);
        $('html').attr('lang', lang);
        const parsedFile = parseFileName(file);
        const newFile = parsedFile.name +
                        (lang === defaultLocale ? '' : '_' + lang) +
                        '.' + parsedFile.ext;
        const html = $.html();
        // console.log(html)
        // Перезаписываем файл
        fs.writeFile(newFile, html, function (err) {
          if (err) return console.log(err);
          console.log('Successfully write ' + newFile);
        });

      });
      // // Удаление тэгов из head
      // $('head :not(link[rel="stylesheet"], script)').remove();
      // $('body h1').remove();
      // // Берем оставшуюся разметку head
      // const headTags = $('head').html().trim();
      // // Берем разметку body
      // const bodyTags = $('body').html();
      // const html = headTags + bodyTags;

      // Перезаписываем файл
      // fs.writeFile(file, html, function (err) {
      //   if (err) return console.log(err);
      //   console.log('Successfully clean ' + file);
      // });
    });
  });
})

/*
 * Копирует файл
 * @param src - путь расположения файла
 * @param dest - путь, куда копируется
 */
function copyFile(src, dest) {
  let readStream = fs.createReadStream(src);
  readStream.once('error', (err) => {
    console.log(err);
  });
  readStream.once('end', () => {
    console.log('done copying');
  });
  readStream.pipe(fs.createWriteStream(dest));
}