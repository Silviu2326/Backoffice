# 📈 Feature: Growth Module

## Overview
The Growth module (Module 15 from the CRM 360° Ultimate specification) is designed to empower freelancers in their professional development and goal achievement. It includes tools for strategic vision setting and continuous learning, acting as a personal development hub within the system.

## Implementation Details
All components related to the Growth module **MUST** be implemented within the `src/features/growth/` directory, organized into the following subdirectories:
- `src/features/growth/pages`: Contains the main page components for the module.
- `src/features/growth/components`: Houses reusable UI components specific to the Growth module.
- `src/features/growth/api`: Manages API service integrations and data fetching logic for the module.

## Key Features

### 15.1. Vision Board (Tablero de Visión)
This feature provides a digital vision board to help users define and track their annual financial and personal objectives.

#### Technical Specifications:
- **Objective Tracking**: Allows users to set annual financial and personal goals.
- **Progress Visualization**: Displays a progress bar linked to real-time invoicing data to show achievement towards financial objectives.
- **Data Integration**: Connects with the invoicing module to automatically update financial progress.
- **User Interface**: A dashboard-like interface presenting goals and their current status, possibly with visual indicators.

### 15.2. Learning CRM (CRM de Aprendizaje)
The Learning CRM serves as a personal knowledge management system for tracking professional development.

#### Technical Specifications:
- **Course Management**: Users can list courses they have purchased, track their completion status, and record notes.
- **Certification Tracking**: Stores information about professional certifications, including their expiry dates.
- **Knowledge Base Integration**: Potentially link to internal SOPs (Module 10) or external learning resources.
- **Reminders**: Implement a notification system for certification renewals.
- **Data Model**:
    - **LearningItem**: Represents a course or certification.
        - `id`: Unique identifier.
        - `type`: 'course' or 'certification'.
        - `name`: Name of the course/certification.
        - `status`: e.g., 'not_started', 'in_progress', 'completed' (for courses).
        - `purchase_date`: Date of purchase (for courses).
        - `completion_date`: Date of completion (for courses).
        - `expiry_date`: Date of expiry (for certifications).
        - `notes`: User-specific notes.
        - `user_id`: Foreign key to the User entity.

### 15.3. OKR Model (Objectives and Key Results)
A structured framework to define and track objectives and their outcomes, ensuring alignment between daily tasks and long-term goals.

#### Technical Specifications:
- **Hierarchy**: Supports defining Objectives (High-level inspirational goals) and Key Results (Measurable steps to achieve the objective).
- **Alignment**: Ability to link OKRs to specific projects, clients, or personal growth areas.
- **Tracking**: Percentage-based tracking for Key Results, which automatically rolls up to update the Objective's overall progress.
- **Data Model**:
    - **Objective**:
        - `id`: Unique identifier.
        - `title`: Description of the objective (e.g., "Increase Brand Awareness").
        - `timeframe`: Period (e.g., Q1 2024, Year 2024).
        - `progress`: Calculated average of linked Key Results progress.
    - **KeyResult**:
        - `id`: Unique identifier.
        - `objective_id`: Reference to the parent objective.
        - `metric`: The specific metric being measured (e.g., "LinkedIn Followers").
        - `target_value`: The numeric goal to reach.
        - `current_value`: The current recorded value.
        - `start_value`: The starting value at the beginning of the period.
        - `confidence`: A subjective confidence score (0-10) on likelihood of achievement.

### 15.4. Gamification (Gamificación)
A system to increase engagement and motivation by awarding Experience Points (XP) and levels for completing system activities.

#### Technical Specifications:
- **XP Calculation Engine**:
    - **Task Completion**: Fixed XP amount per completed task (e.g., 10 XP for a small task, 50 XP for a project milestone).
    - **Consistency**: "Streak" bonuses for logging in or completing tasks on consecutive days.
    - **Learning**: Bonus XP for completing courses in the Learning CRM.
- **Leveling System**:
    - XP accumulation leads to user levels (Level 1 -> Level 2).
    - Visual feedback (progress bars, level up animations).
- **Integration**:
    - Listen to system events (e.g., `TaskCompleted`, `InvoicePaid`, `CourseFinished`) to trigger XP awards.
    - **Leaderboard** (Optional): Comparison with previous months' performance.

### 15.5. Progress Visualization (Visualización de Progreso)
Advanced visual representation of growth metrics using Area Charts to show trends and volume over time.

#### Technical Specifications:
- **Chart Implementation**: Use a charting library (e.g., Recharts) to render responsive Area Charts.
- **Key Metrics Visualized**:
    - **XP Growth Curve**: Cumulative XP over time to visualize momentum.
    - **Productivity Trends**: Number of tasks completed or hours logged (from Time Tracking) visualized as an area chart to show density of work.
    - **Financial Growth**: Cumulative revenue against the baseline, showing the "area" of income.
- **Features**:
    - **Gradients**: Use color gradients (fill opacity) to make the charts visually appealing and distinct.
    - **Tooltips**: Interactive hover states displaying exact values and dates.
    - **Time Filters**: Toggle between Weekly, Monthly, and Quarterly views.