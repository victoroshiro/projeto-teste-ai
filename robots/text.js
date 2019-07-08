const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('./../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sdb')

async function robot(content) {

    await fetchContentWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);

    async function fetchContentWikipedia() {

        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAuthenticated = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300')
        const wikipediaResponse = await wikipediaAuthenticated.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponse.get();

        content.sourceContentOriginal = wikipediaContent.content;

    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal);

        content.sourceContentOriginal = withoutBlankLinesAndMarkdown;

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            });

            return withoutBlankLinesAndMarkdown.join(' ');

        }
    }

    function breakContentIntoSentences(content) {
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentOriginal)
        sentences.forEach((sentence) => {
          content.sentence.push({
              text: sentence,
              keywords: [],
              images: []
          })
        })


    }
}

module.exports = robot