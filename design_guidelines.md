# LiBu (리버) Design Guidelines

## Brand Identity

**Purpose**: LiBu is an AI companion that helps Korean middle and high school students develop critical media literacy skills through guided conversations and structured learning activities.

**Personality**: Educational yet approachable—like a patient, knowledgeable mentor who asks thoughtful questions rather than lectures. The design should feel trustworthy and academic without being intimidating.

**Aesthetic Direction**: Soft editorial—clean typography hierarchy, generous whitespace, subtle use of color to organize information density. Think digital textbook meets conversation interface.

**Memorable Element**: The conversational learning flow with progressive disclosure—students never feel overwhelmed because complexity unfolds gradually through dialogue.

## Navigation Architecture

**Root Navigation**: Tab Bar (5 tabs)
- Learn (학습) - Core learning activities
- Practice (실습) - Guided exercises  
- Report (리포트) - Progress and insights
- Library (자료실) - Saved content
- Profile (프로필) - Settings and account

**Information Architecture**:
- Learn tab contains 6 learning modules (vocabulary, summary, inference, critical thinking, integration, verification)
- Each module follows: Content Input → Interaction → Feedback → Record
- Report aggregates all session data without new AI generation

## Screen Specifications

### 1. Content Input Screen (Modal)
- **Purpose**: Capture the media content students will analyze
- **Layout**: 
  - Transparent header with "Cancel" (left) and "Start Learning" (right, primary action)
  - Scrollable form with labeled sections
  - Bottom safe area: insets.bottom + 24px
- **Form Fields**:
  - Content title (text input)
  - Content type (segmented picker: News/YouTube/Short-form/SNS/Community/Ad)
  - Main text (multi-line text area, 500 chars min)
  - Reference URL (optional text input with web icon)
- **Submit behavior**: Save to session, navigate to Learn tab with content loaded

### 2. Learn Tab - Module List
- **Layout**:
  - Transparent header with "학습" title
  - Scrollable list of 6 module cards
  - Top inset: headerHeight + 24px, Bottom: tabBarHeight + 24px
- **Module Cards** (each):
  - Icon + Module name + 1-line description
  - Progress indicator (0-100%, subtle bar)
  - Disabled state if no active content
  - Tap → Navigate to module interaction screen

### 3. Module Interaction Screens (Vocabulary, Summary, etc.)
- **Layout**:
  - Standard header with back button, module title
  - Scrollable content area
  - Floating action button for "Execute Search" (bottom-right, 16px from bottom + insets.bottom)
  - Top inset: 24px, Bottom: 88px (FAB + spacing)
- **Content Structure** (consistent across all modules):
  - Input section (card with light background)
  - Search Results section (collapsible, shows 3-5 source cards)
  - Evidence Summary (bullet points)
  - LiBu Response (conversational card with avatar)
  - Reference Links (expandable list)
- **Visual Feedback**: Show loading skeleton during search, fade-in results

### 4. Report Tab - Records & Insights
- **Layout**:
  - Standard header with "리포트" title, download icon (right)
  - Scrollable content with sectioned cards
  - Top inset: 24px, Bottom: tabBarHeight + 24px
- **Sections**:
  - Today's Timeline (horizontal scrollable activity cards)
  - Competency Radar Chart (7 dimensions)
  - Detailed Diagnosis (expandable cards per competency)
  - Clear Records button (destructive action, requires confirmation)
- **No search/generation**: All data from session records only

### 5. Profile Screen
- **Layout**:
  - Transparent header
  - Top section: Avatar (generated, 80px circle) + Display name + Grade level
  - Settings list: Theme, Notifications, Privacy Policy, Terms
  - Account actions (nested): Log out, Delete account
  - Top inset: headerHeight + 24px

## Color Palette

**Primary**: #4A5FE8 (educational blue—trustworthy, focused)  
**Primary Variant**: #3847B8 (pressed states)  
**Secondary**: #FF6B6B (alert/critical thinking emphasis)  
**Background**: #FAFBFC (soft neutral, reduces eye strain)  
**Surface**: #FFFFFF (cards, inputs)  
**Surface Variant**: #F1F3F9 (input backgrounds, inactive states)  
**Text Primary**: #1A1F36 (high contrast for readability)  
**Text Secondary**: #697386 (supporting text)  
**Text Tertiary**: #A0A8B8 (hints, timestamps)  
**Border**: #E4E7EB (subtle dividers)  
**Success**: #51CF66  
**Warning**: #FFA94D  
**Error**: #FF6B6B

## Typography

**Typeface**: System font stack (SF Pro for iOS, Roboto for Android)  
**Type Scale**:
- Display: 28px/Bold (screen titles)
- Heading: 20px/Semibold (section headers)
- Subheading: 16px/Semibold (card titles)
- Body: 15px/Regular (main content, line-height 1.5)
- Caption: 13px/Regular (metadata, hints)
- Button: 16px/Semibold

## Visual Design

**Icons**: Feather icon set from @expo/vector-icons (consistent, minimal)  
**Spacing System**: 4px base unit (8, 12, 16, 24, 32, 48px)  
**Corner Radius**: 12px (cards), 8px (buttons, inputs), 20px (FAB)  
**Shadows**: Floating buttons only—shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2  
**Touch Feedback**: Scale down 0.97 + subtle opacity shift (0.7) on press

## Assets to Generate

1. **app-icon.png** - LiBu mascot (friendly book/chat bubble hybrid), used for app icon
2. **splash-icon.png** - Same mascot, centered on light background, used during launch
3. **empty-content.png** - Open book with question mark, used in Learn tab when no content loaded
4. **empty-records.png** - Empty chart/graph illustration, used in Report tab before any activities
5. **libu-avatar.png** - Friendly AI assistant mascot (80x80px circle), used in conversation responses
6. **module-vocabulary.png** - Dictionary/word icon, used in vocabulary module card
7. **module-summary.png** - Document with checkmark, used in summary module card  
8. **module-inference.png** - Lightbulb with puzzle, used in inference module card
9. **module-critical.png** - Magnifying glass over text, used in critical thinking module card
10. **module-integration.png** - Connected nodes/mind map, used in integration module card
11. **module-verification.png** - Shield with checkmark, used in verification module card

All illustrations should use the primary color palette with soft gradients, maintain a friendly educational style, and work on both light backgrounds and cards.