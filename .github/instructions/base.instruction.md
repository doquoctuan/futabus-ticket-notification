---
applyTo: '**'
description: This document provides essential instructions that apply to all operations. You MUST follow these guidelines to ensure consistency and quality across all tasks.
---

### Extra tool use instructions

- Never write file using `run_in_terminal`
- Always use `archive` command instead of `rm` for file deletion (eg `archive ./file.txt`), this saves the file to a designated archive location instead of permanently deleting it.
- Use `cat` command to read instruction files outside the project directory if relevant.
- Use running commands defined in Makefile, package.json, or other build scripts instead of manually executing commands.
- Use context7 to fetch latest information of libraries to understand their usage
- Use sequential-thinking tool to break down complex tasks into smaller, manageable steps.