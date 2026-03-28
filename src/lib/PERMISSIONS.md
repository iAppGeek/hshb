# Role Permissions Summary

Four roles exist: **teacher**, **admin**, **headteacher**, **secretary**.

## CRUD Permissions

| Action                  | teacher | admin | headteacher | secretary |
| ----------------------- | ------- | ----- | ----------- | --------- |
| Create students         | -       | Yes   | -           | -         |
| Edit students           | -       | Yes   | -           | -         |
| Create staff            | -       | Yes   | -           | -         |
| Edit staff              | -       | Yes   | -           | -         |
| Create classes          | -       | Yes   | Yes         | -         |
| Edit classes            | -       | Yes   | Yes         | -         |
| Edit guardians          | -       | Yes   | -           | -         |
| Edit incidents          | -       | Yes   | Yes         | -         |
| Edit timetables         | -       | Yes   | Yes         | -         |
| Create lesson plans     | Yes     | Yes   | Yes         | -         |
| Edit lesson plans       | Yes     | Yes   | Yes         | -         |
| Update attendance       | Yes     | Yes   | Yes         | -         |
| Manage staff attendance | -       | Yes   | Yes         | -         |

## Data Visibility

| Capability               | teacher | admin | headteacher | secretary |
| ------------------------ | ------- | ----- | ----------- | --------- |
| See all data             | -       | Yes   | Yes         | Yes       |
| See staff contact info   | -       | Yes   | Yes         | Yes       |
| See student medical info | -       | Yes   | Yes         | Yes       |

## Feature Access

| Feature                    | teacher | admin | headteacher | secretary |
| -------------------------- | ------- | ----- | ----------- | --------- |
| Access reports             | -       | Yes   | Yes         | Yes       |
| Receive push notifications | -       | Yes   | Yes         | -         |

## Other Rules

| Rule                   | teacher | admin | headteacher | secretary |
| ---------------------- | ------- | ----- | ----------- | --------- |
| Shows on sign-in sheet | Yes     | -     | Yes         | Yes       |
| Is teaching staff      | Yes     | -     | Yes         | -         |

## Notes

- Teachers can only create/edit lesson plans for their own classes.
- Teachers and secretaries can sign themselves in/out but cannot sign in/out other staff.
- Admins and headteachers can sign in/out any staff member.
- Secretaries can save new attendance but cannot update existing attendance records.
- All permission functions are defined in `permissions.ts` alongside this file.
