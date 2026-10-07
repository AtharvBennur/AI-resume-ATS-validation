# Project testing

Run the complete smoke suite from the repository root:

```powershell
C:/Users/athar/AppData/Local/Programs/Python/Python314/python.exe testing/run_tests.py
```

The suite checks:

- The backend folder structure shown in the requested layout.
- All routes declared in the React router.
- Authentication guard and login API wiring.
- Frontend lint and production build.
- Backend automated tests.
- HTTP availability of every static frontend route through Vite.

Dynamic routes and the wildcard route are excluded from direct HTTP checks because
they require a concrete parameter or client-side fallback behavior.
