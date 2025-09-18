## Multi-Agent Rescue System

This is a multi-agent emergency rescue system designed for disaster response scenarios. The system coordinates multiple autonomous agents to perform search and rescue operations efficiently.

### Architecture Overview

The system consists of:
- **Commander**: Central coordination agent
- **GeoAnalyst**: GIS analysis agent
- **UAVController**: Unmanned Aerial Vehicle controller
- **ClosureAgent**: Task completion agent

### Key Features

- Real-time coordination of multiple rescue agents
- Geospatial analysis capabilities
- UAV control and monitoring
- Emergency response management

### Installation

```bash
pip install -r requirements.txt
```

### Usage

To start the system:

```bash
python run_host.py
```

### Agents

#### Commander
Coordinates all rescue operations and decision making

#### GeoAnalyst
Analyzes geographic data and provides spatial insights

#### UAVController
Controls drones for aerial surveillance and data collection

#### ClosureAgent
Monitors and concludes rescue missions when objectives are met

### Message System

Agents communicate through a structured message system with various message types including:
- Emergency alerts
- GIS data sharing
- UAV status updates
- Command directives

### Toolbox

The system includes various utility tools for:
- AirSim API integration
- Task publishing
- QGIS MCP integration
- Handoff protocols between agents