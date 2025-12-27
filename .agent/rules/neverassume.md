---
trigger: always_on
---

<never_assume_external_values>
Never assume, guess, or make up external values including:
- URLs and domain names
- API endpoints and keys  
- Configuration values
If the value is not in the existing code or stated by the user, ASK for clarification.
Use dynamic methods like window.location.origin when possible.
</never_assume_external_values>