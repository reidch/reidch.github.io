# Collaborative VR Restaurant

This is a multiplayer VR restaurant simulation designed around cooperation rather than parallel individual play. The service process is divided into interdependent responsibilities, requiring players to share information, coordinate timing and complete different stages of the same workflow.

The core loop follows customer reception, order creation, food preparation, delivery validation and performance feedback. No single role can complete the entire sequence independently.

## Core Structure

The experience is organised across three connected functional areas:

- **Preparation area** — role selection and session setup
- **Dining area** — customer queues, reception, seating, waiting and serving
- **Kitchen area** — shared orders, food preparation and dish completion

These areas form different stages of one continuous cooperative pipeline rather than isolated scenes.

## Role-Based Cooperation

The game contains three interdependent roles:

- **Reception role** — receives queued customers, assigns seats and calms customers whose waiting time becomes too long
- **Cooking role** — prepares dishes according to active shared orders
- **Delivery role** — carries completed dishes to the correct customers

Interactions are gated by role. This prevents one player from performing the entire workflow and makes collaboration a structural requirement.

## Customer Queue and Behaviour States

Customers enter through a visible queue. When the front customer is received, the remaining queue advances.

Each customer has both action states and emotional states.

Action states include:

- Queueing
- Ordering
- Seating
- Waiting
- Leaving

Emotional states include:

- Normal
- Nervous
- Angry
- Satisfied

A waiting timer begins after seating. Delayed service escalates customer emotion and creates pressure on the team. The reception role can temporarily calm a waiting customer, giving the preparation and delivery stages more time.

## Shared Order Management

Once a customer is seated, the requested dish is added to a shared order list displayed in the kitchen.

The order system:

- Creates and tracks active requests
- Synchronises task information across players
- Shows which dishes still need preparation
- Removes completed or cancelled requests
- Connects the dining and kitchen areas into one workflow

The shared board externalises task information so that players can coordinate through a common environmental reference instead of relying only on memory.

## Food Preparation and Completion Validation

Food is prepared through object-based interactions rather than an instant completion command.

The system checks:

- Whether all required components are present
- Whether preparation has been completed
- Whether the dish type matches an active order
- Whether the correct role continues the next stage

Only dishes that pass the completion check can enter the delivery phase.

## Delivery Validation

The serving interaction performs additional validation:

- The dish must be complete
- The recipe must match the target customer's order
- The dish must be sufficiently close to the intended customer
- The serving action must be performed by the correct role

This connects kitchen preparation, order information and final delivery into a single verified sequence.

## Cooperative Pressure and Pacing

Waiting time, customer emotion and order accumulation create dynamic pressure.

The reception role manages customer flow, the cooking role responds to active requests, and the delivery role identifies the correct target and completes service. Delays in one stage affect the rest of the pipeline.

Players must therefore communicate about:

- Which customers are waiting
- Which orders are being prepared
- Which dishes are complete
- Which customer requires priority
- Where the workflow is currently blocked

## Scoring and Feedback

The game records both individual contribution and team performance.

Points are awarded for:

- Receiving and calming customers
- Completing correct dishes
- Delivering the correct food to the correct customer
- Maintaining the shared service workflow

Feedback panels communicate current events, order states and final performance, helping players understand how individual actions affect the team.

## Complete Gameplay Loop

The current prototype supports a complete basic loop:

1. Customers enter the queue
2. The reception role receives and seats a customer
3. An order is created and shared with the kitchen
4. The cooking role assembles the requested dish
5. The system validates dish completion
6. The delivery role carries it to the intended customer
7. The system checks the order, distance and role
8. Customer state and team score are updated
9. The order ends and the next customer enters the workflow

## Design Focus

The project is not a collection of isolated interaction scripts. Role permissions, customer states, shared orders, dish validation, delivery checks and scoring are connected into one cooperative chain.

Every subsystem supports the same shared objective, making communication and role interdependence part of the gameplay structure itself.
