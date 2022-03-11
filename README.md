# Brokering Additive Manufacturing Living Lab

## Contents

- [What are we creating?](#what-are-we-creating)
- [How are we doing it?](#how-are-we-doing-it)
- [Running the service.](#running-the-service)
- [The role of the broker](#the-role-of-the-broker)

## What are we creating?

**[TODO]**

![](https://github.com/jamesgopsill/bam-living-lab-broker/blob/main/figs/arch.png)

## How are we doing it?


**[TODO]**

![](https://github.com/jamesgopsill/bam-living-lab-broker/blob/main/figs/living-lab.png)

- [Ultimaker Client](https://github.com/jamesgopsill/ultimaker-client)
- [Prusa Client](https://github.com/jamesgopsill/prusa-client)
- [Octoprint Client](https://github.com/jamesgopsill/octoprint-client)

## The role of the broker.

**[TODO]**

## Running the broker.

"""
import { Broker, BrokerConfig } from "@jamesgopsill/bam-living-lab-server"

const config: BrokerConfig = {
	logFolderPath: "",
	accessLogsKey: "",
	socketKey: "",
	debug: false
}

const broker = new Broker(config)

broker.start()
"""

## Contributing

We would love to have additional contributors to the project to help us maintain and add functionality to the project.

## Support the Project

The project has been supported by the [EPSRC-funded Brokering Additive Manufacturing project (EP/V05113X/1)](https://gow.epsrc.ukri.org/NGBOViewGrant.aspx?GrantRef=EP/V05113X/1). More details on the project can be found at the [Design Manufacturing Futures Lab](https://dmf-lab.co.uk/) website.

If you like this project, please consider sponsoring the developers so they can continue to maintain and improve the package.

## Publications