# React Native/Expo Feature Development

Complete end-to-end Expo/React Native feature development workflow with Product Manager → Developer → Code Reviewer → Automation Engineer → Documentation Engineer.

## Task

I'll launch the `expo-react-native-workflow-orchestrator` agent to coordinate a complete feature development workflow for: $ARGUMENTS

## Process

I'll use the Task tool to launch the orchestrator agent with the feature request, which will:

1. **Requirements Analysis** - Launch Product Manager agent to create task breakdown
2. **Implementation** - Launch Expo/React Native Developer agent to build the feature
3. **Code Review** - Launch Code Review Engineer to ensure quality and security
4. **Test Automation** - Launch Automation Engineer to add comprehensive tests
5. **Documentation** - Launch Documentation Engineer to create all docs
6. **Final Report** - Summarize completion and artifacts created

The orchestrator agent will handle all coordination automatically.

## Usage Examples

```bash
# Camera feature with native integration
/react-native-feature "Create camera capture feature with expo-camera, image preview, and gallery save"

# User profile with biometrics
/react-native-feature "Implement user profile screen with biometric authentication and secure storage"

# Real-time chat
/react-native-feature "Build real-time chat feature with WebSocket, push notifications, and offline support"

# Map-based location tracker
/react-native-feature "Create location tracking feature with maps, geofencing, and background location updates"
```

## Notes

- Each agent runs sequentially using outputs from previous agents
- All agents communicate via files in `.claude/tasks/<feature>/`
- Product manager creates the roadmap, others execute it
- Final deliverable is production-ready, tested, documented mobile code
- All work is tracked in git with proper commit messages
- Tests on both iOS and Android platforms
- Uses Expo Router, EAS Build, and modern React Native patterns
- Includes E2E tests with Detox for both platforms
