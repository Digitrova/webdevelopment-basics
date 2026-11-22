# Deploy Web Academy (browser-only)

1. Extract the ZIP.
2. Upload all files and folders to the root of the GitHub repository, replacing previous LMS files.
3. Commit and push. Vercel should deploy automatically.
4. Visit `/admin.html` and create the first admin account.
5. Visit `/login.html` to create student accounts.

No backend keys, environment variables, SQL, Supabase, Firebase or server functions are required.

## Data persistence
Data is saved in the browser's local storage on the device and browser profile used. Use Admin → Settings & backup → Download backup regularly. To move data to another browser, restore that JSON backup there.

## Important
This is not secure multi-user authentication. Client-side roles are for local/demo administration only and can be bypassed by someone with browser developer tools. Use a real backend for public, sensitive or paid learning services.
