#!/usr/bin/env node

import { Command } from 'commander'
import { crawlLoop, filterLongNewsSortByComments, filterShortNewsSortByPoints } from './logic/index'

const program = new Command()

program
  .name('hacknews')
  .description('A CLI web crawler with scraping for the website news.ycombinator.com')
  .version('0.0.1')

program
  .command('run')
  .description('Keeps running, updating the saved data every specified interval')
  .option('-m, --minutes', 'Run every minute')
  .option('-h, --hour', 'Run every hour')
  .action(async (options: any) => {

    let interval = 0
    if (options.minutes) interval = 60 * 1000
    else if (options.hour) interval = 60 * 60 * 1000
    else {
      console.log('Please specify --minutes or --hour')
      process.exit(1)
    }

    console.log(`Starting crawl loop every ${options.minutes ? 'minute' : 'hour'}`)
    console.log(`Stop process with CTRL+C`)

    const timer = await crawlLoop(interval)

    process.on('SIGINT', () => {
      console.log('\nStopping crawl loop...')
      clearInterval(timer)
      process.exit(0)
    })
  })

program
  .command('long')
  .description('generates a file with the last retrived data filtered by titles longer than 5 words and sorted by number of comments')
  .action(() => {
    try {
      filterLongNewsSortByComments()
      console.log('check data on folder build/data/long')
    } catch (error) {
      console.error(error)
    }

  })

program
  .command('short')
  .description('generates a file with the last retrived data filtered by titles with 5 words or less and sorted by points')
  .action(() => {
    try {
      filterShortNewsSortByPoints()
      console.log('check data on folder build/data/short')
    } catch (error) {
      console.error(error)
    }
  })

program.parse(process.argv)
