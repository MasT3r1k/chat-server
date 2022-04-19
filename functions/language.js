const languages = require('../configuration/languages.json');

module.exports.changeLanguage = (language, req, res) => {
    req.session.language = language;
    return true;
};

module.exports.getLanguage = (req, res) => {
    return req.session.language;
};

module.exports.get = (language, string) => {
    return languages[language][string];
};

module.exports.getInput = (string, callback) => {
    Object.keys(languages.inputs).forEach(element => {
        if (languages?.['inputs']?.[element].includes(string)) {
            callback(element);
        }
    });
};

// this.getInput("login_wrong_password", (element) => {
//     console.log(element);
// });