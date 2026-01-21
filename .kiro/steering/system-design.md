---
inclusion: always
---

ALWAYS follow the following system design principles and coding practises to write maintainable and scalable code:

## Principles

- SOLID
  - S: Single-responsibility Principle
  - O: Open-closed Principle
  - L: Liskov Substitution Principle
  - I: Interface Segregation Principle
  - D: Dependency Inversion Principle

- KISS: Keep it simple, stupid

- DRY: Don't repeat yourself

- YAGNI: You aren't going to need it

- Test Driven Development

- Object Oriented Programming


## Best Practises

- Use type hints (e.g., function process({data}: {data: Record<string, string>[];}): Record<string, string>[] {return [];})

- Always use path alias imports (import '...' from '@/lib/...') even if the files are in the same directory

- Don't go over 200 lines in any file. If a goes beyond 200 lines, split the code into separate files.