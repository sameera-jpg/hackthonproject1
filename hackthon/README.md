# ShareBite – Food Waste Management System

A responsive frontend-only food donation and food waste management website built with React, Vite, HTML, CSS, JavaScript and Bootstrap 5.

## Features
- Home, About, Find Food and Impact pages
- User registration and login using browser Local Storage
- Demo Admin, Donor, NGO and Volunteer accounts
- Add food donations with category, quantity, location, expiry date and contact validation
- Search food by name, donor, description or location
- Filter food by category and location
- View food details and claim food with a pickup date/time request
- User dashboard with donations and claims
- Admin dashboard to view users, food listings and claims; delete food listings
- NGO/Volunteer dashboard to coordinate pickup requests and mark them completed
- Impact statistics, community leaderboard and printable appreciation certificate
- Responsive design for desktop, tablet and mobile
- No backend or database required

## Run in VS Code
1. Extract the ZIP file.
2. Open the **ShareBite_Complete_Project** folder in VS Code (the folder containing `package.json`).
3. Open Terminal > New Terminal.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the localhost URL printed by Vite, normally `http://localhost:5173/`.

Keep the terminal running while using the website.

## Demo accounts
- Admin: `admin@sharebite.com` / `admin123`
- Donor: `donor@sharebite.demo` / `donor123`
- NGO: `ngo@sharebite.demo` / `ngo123`
- Volunteer: `volunteer@sharebite.demo` / `vol123`

You can also register a new account and select Individual/Donor, NGO or Volunteer.

## Reset demo data
Open the website, press F12 > Console, and run:
```js
localStorage.removeItem('sharebite_v2_users');
localStorage.removeItem('sharebite_v2_foods');
localStorage.removeItem('sharebite_v2_session');
localStorage.removeItem('sharebite_v2_claims');
localStorage.removeItem('sharebite_v2_pickups');
location.reload();
```

## Important project scope
This is a frontend demonstration for a frontend-development hackathon. Data is saved only in the current browser using Local Storage. It is not a production service: passwords are not securely protected, data is not shared between devices, and no real food safety inspection, delivery, map tracking, notifications or backend processing is provided. Impact meal/weight figures are illustrative demo estimates.
