module.exports = {
    "extends": "airbnb",
    "parser": "babel-eslint",
    "globals": {
      "window": true,
      "document": true,
      "it": true,
      "FileReader": true
    },
    "rules": {
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
      "semi": [
          "error",
          "never"
      ],
      "no-underscore-dangle": [ 0 ],
      "consistent-return": [ 0 ],
      "jsx-a11y/no-autofocus": [ 0 ],
      "jsx-a11y/anchor-is-valid": [ "error", {
        "components": [ "a" ]
      }]
    }
};
