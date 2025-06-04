# FirstRepair Consultation Platform

This project is a web application for FirstRepair, allowing users to submit consultation requests. It's built with React and Vite, uses Vitest for unit testing, Firebase for backend services (Firestore database, Authentication), and EmailJS for email notifications.

# Requirements

Node.js 20 or greater.

## Usage

To set up the project locally:

```bash
mkdir your-app-name
cd your-app-name
npx degit https://github.com/394-s25/first-repair # Or clone your repository
npm install
```

If the `npx degit` step hangs, you can manually clone the repository and then run `npm install`.

## Environment Variables

This project uses environment variables for configuration, particularly for Firebase and Google Maps API keys, and EmailJS service details. Create a `.env` file in the root of the project and add the following variables:

```env
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
# Add any other VITE_ prefixed variables used by EmailJS or other services if necessary
# e.g., VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_USER_ID (though these seem to be hardcoded in NewForm.jsx)
# VITE_RECAPTCHA_SITE_KEY="YOUR_RECAPTCHA_SITE_KEY" (if you make it an env var)
```
Replace `"YOUR_..."` with your actual credentials and keys.

## Test

Verify that the initial app works. Run:

```bash
npm start
```

and open the URL displayed (usually `http://localhost:5173` or similar for Vite).

Verify that the unit tests work with:

```bash
npm test
```

This will run the test suite using Vitest.

## Scripts

**package.json** defines the following common scripts:

| Script           | Description                                                |
| -----------------| ---------------------------------------------------------- |
| `npm run dev`    | Runs the app in development mode with hot reloading (Vite). |
| `npm start`      | Alias for `npm run dev`.                                   |
| `npm run build`  | Builds the app for production to the `dist` folder.        |
| `npm run serve`  | Serves the production build from the `dist` folder (Vite preview). |
| `npm test`       | Starts the Vitest test runner in watch mode.               |
| `npm run coverage`| Runs tests and generates a code coverage report.          |

*(Note: `npm run serve` in Vite is typically `npm run preview`. Adjust if your `package.json` uses a different command for serving the build.)*

## Git

If everything is working, set up [your local and remote repositories](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github#adding-a-local-repository-to-github-using-git).

## Folder Structure

```
first-repair
├── node_modules
├── public
│   ├── favicon.svg
│   └── firstrepair.jpg
│   └── robots.txt
├── src
│   ├── api
│   │   ├── consultationService.js
│   │   └── spreadsheetService.js
│   ├── components
│   │   ├── FormTextField.jsx
│   │   ├── LocationAutocomplete.jsx
│   │   ├── MultiSelectDropdown.jsx
│   │   ├── NewForm.jsx
│   │   ├── NewForm.test.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── SingleSelectDropdown.jsx
│   │   ├── SubmitButton.jsx
│   │   └── resolved-test-genai.test.jsx
│   ├── contexts
│   │   └── AuthContext.jsx
│   ├── firebase
│   │   └── firebase_ini.js
│   ├── pages
│   │   ├── DashboardPage.jsx
│   │   └── LoginPage.jsx
│   ├── utils
│   │   └── regionMapping.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx  (or index.jsx, typical entry point for Vite React)
│   └── setupTests.js (if used by Vitest config)
├── .env
├── .gitignore
├── index.html (Vite's entry HTML)
├── package.json
├── README.md
├── vite.config.js
```

## Credits

Original React-Vitest template built and maintained by [Chris Riesbeck](https://github.com/criesbeck).
Inspired by [SafdarJamal/vite-template-react](https://github.com/SafdarJamal/vite-template-react).
Expanded to include Vitest and some sample tests.

Thanks to Rich Harris for [degit](https://www.npmjs.com/package/degit).

Gitignore file created with [the Toptal tool](https://www.toptal.com/developers/gitignore/api/react,firebase,visualstudiocode,macos,windows).

Project developed by [Team Yellow/CS394 2025 Spring].

## License

This project is licensed under the terms of the [MIT license](./LICENSE).
