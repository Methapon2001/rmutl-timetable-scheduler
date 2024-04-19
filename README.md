# RMUTL Computer Engineering Timetable Scheduler System

## Prerequisite

- [Node.js LTS](https://nodejs.org/en/download)
  - Linux can install using nvm `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash`
  - Version used in development is 18.x.x
- [MariaDB/MySQL](https://mariadb.org/download)
  - For windows, can use [XAMPP](https://www.apachefriends.org/)
  - For linux, can install from distro repositories

## Installation

- (Optional) - As this project always use pnpm to manage deps, to install pnpm run - `npm i -g pnpm` or else use `npm` instead of `pnpm`
- `git clone https://github.com/Methapon2001/rmutl-timetable-scheduler.git`
- `cd rmutl-timetable-scheduler`
- Create `.env` file. Secret is import as it is used for jwt authentication process
  ```env
  DATABASE_URL="mysql://username:password@localhost:port/database_name"
  APP_SECRET="my_secret"
  APP_PORT=80
  ```
- `cd client`
- `pnpm i`
- (Optional) - Create `.env` file and replace hostname with IP Address or Domain name
  ```env
  PUBLIC_API_HOST="http://hostname"
  PUBLIC_API_WS="ws://hostname/websocket"
  ```
- `pnpm run build`
- `cd ..`
- Go back to server side and run `pnpm i`
- **_1st run only or database structure related commit_** run - `pnpm run db:push`
- **_1st run only_** to create admin user run - `pnpm run db:seed`
- **_Once every server related commit_** run - `pnpm run build`
- `pnpm run start` or using `pm2` to run server.
