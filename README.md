# FIFO by Irisoft

This repo contains both the client and server applications for running the full FIFO stack.

## **Local Development:** How to Get Started

### Yarn
Install `yarn` if you don't have it. For MacOS, you can use `brew`
Otherwise, go here: https://yarnpkg.com/lang/en/docs/install/#mac-stable

```bash
brew install yarn
```

### Clone This Repo
```bash
# Change to dir where you want to store the source code
cd /some/dir

# Clone this repo from Github
git clone https://github.com/irisoft/frameinventory.git
```

### Environment Variables
You'll need one environment variable. You can find the value you need in the Heroku App Dashboard under Settings.

```bash
export DATABASE_URL="export DATABASE_URL='postgres://xxx:xxx@xxxx:xxxx/xxxx"
```

### Run It
Switch to the new `frameinventory` subdirectory
```bash
cd /some/dir/frameinventory
yarn start
```

At this point, your browser should open automatically. 
