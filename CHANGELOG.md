### Preview 0.1.0 (2025-08-29)

- Added `InputSetState` filtering with the `conditional(...)` function, which accepts a predicate to decide whether an input set (or only certain actions from it) should currently be listening to events.
- Fixed `InputManager` effects being owned and disposed by the first component calling `InputSet.state`.

### Preview 0.0.1 (2025-08-28)

- Initial preview release.
