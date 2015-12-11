uptime-multimail
==============

It's a simple plugin to provide multi emailing by check for the [Uptime](ttps://github.com/fzaninotto/uptime) app by [@fzaninotto](https://github.com/fzaninotto).


Installing
----------

To install, clone the repository on your `plugin` directory:

```sh
$ git clone git://github.com/acoquoin/uptime-multimail.git hipchat
```

Install dependencies using `npm`:

```sh
$ npm install nodemailer@0.7
```


Configuring
-----------

Edit your `config` file, to activate the plugin, just add the plugin:

```yaml
plugins:
  - ./plugins/multimail
```

And append the configuration:

```yaml
multimail:
    method:       SMTP
    transport:    # see https://github.com/andris9/Nodemailer/tree/0.7 for transport options
        auth:
            user: foobar@gmail.com
            pass: ********
    from:         'Uptime <uptime@domain.com>'
    event:
        up:       <true|false>
        down:     <true|false>
        paused:   <true|false>
        restarted:<true|false>
```

License
-------

This code is free to use and distribute, under the [MIT license](https://github.com/acoquoin/uptime-multimail/blob/master/LICENSEE).

TODO
----

* Unit tests
