const fs = require('fs');

module.exports = class HTML_Loader
{
    constructor(filePath)
    {
        this.htmlText = fs.readFileSync(filePath, 'utf8');
    }

    create()
    {
        return document.createRange().createContextualFragment(this.htmlText);
    }
}
