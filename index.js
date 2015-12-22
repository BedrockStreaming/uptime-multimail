
 /**
 * Multimail plugin
 * https://github.com/acoquoin/uptime-multimail
 *
 * Notifies all events (up, down, paused, restarted) by multiple email
 *
 * Installation
 * ------------
 * This plugin is disabled by default. To enable it, add its entry
 * from the `plugins` key of the configuration:
 *
 *   // in config/production.yaml
 *   plugins:
 *      - ./plugins/multimail
 *
 * Usage
 * -----
 * This plugin sends emails each time a check is started, goes down, or goes back up.
 * When the check goes down, the email contains the error details:
 *
 *   Object: [Down] Check "FooBar" just went down
 *   On Thursday, September 4th 1986 8:30 PM,
 *   a test on URL "http://foobar.com" failed with the following error:
 *
 *     Error 500
 *
 *   Uptime won't send anymore emails about this check until it goes back up.
 *   ---------------------------------------------------------------------
 *   This is an automated email sent from Uptime. Please don't reply to it.
 *
 * Configuration
 * -------------
 * Here is an example configuration:
 *
 *   // in config/production.yaml
 *   multimail:
 *     method:      SMTP  # possible methods are SMTP, SES, or Sendmail
 *     transport:         # see https://github.com/andris9/nodemailer for transport options
 *       service:   Gmail
 *       auth:
 *         user:    foobar@gmail.com
 *         pass:    gursikso
 *     from:        'Uptime <uptime@domain.com>'
 *     event:
 *       up:        <true|false>
 *       down:      <true|false>
 *       paused:    <true|false>
 *       restarted: <true|false>
 */
var CheckEvent  = require('../../models/checkEvent'),
    ejs         = require('ejs'),
    fs          = require('fs'),
    moment      = require('moment'),
    nodemailer  = require('nodemailer');

exports.initWebApp = function(options) {
    var dashboard = options.dashboard,
        config    = options.config.multimail,
        mailer    = nodemailer.createTransport(config.method, config.transport);
    dashboard.on('populateFromDirtyCheck', function(checkDocument, dirtyCheck, type) {
        checkDocument.setPollerParam('multimail', dirtyCheck.multimail.split(/,|;|\/|\|/gi).map(function(email) {
          return email.toLowerCase().trim();
        }).join(', '));
    });
    dashboard.on('checkEdit', function(type, check, partial) {
        partial.push(ejs.render(fs.readFileSync(__dirname + '/views/edit.ejs', 'utf8'), {locals: {check: check}}));
    });
    CheckEvent.on('afterInsert', function(checkEvent) {
        if (!config.event[checkEvent.message]) {
            return;
        }
        checkEvent.findCheck(function(err, check) {
            if(null !== check.pollerParams.multimail && check.pollerParams.multimail.length > 0) {
                if (err) {
                    return console.error(err);
                }

                var message = ejs.render(fs.readFileSync(__dirname + '/views/email.ejs', 'utf8'), {
                    check: check,
                    checkEvent: checkEvent,
                    url: config.url || options.config.url,
                    moment: moment
                }).split('\n');
                var from = config.from.split(/(.*)\s<(.*@.*\..*)>/gi);
                var mailOptions = {
                    from:    config.from,
                    to:      check.pollerParams.multimail,
                    subject: message.shift(),
                    text:    message.join('\n')
                };
                mailer.sendMail(mailOptions, function(error, response) {
                    if (error) {
                        return console.log('['+ check.name + '] multimail: ' + error);
                    }
                });
            }
        });
    });
};
