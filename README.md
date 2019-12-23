kintone SendGrid plug-in
====

This plug-in enables kintone to send Emails through SendGrid.

## Documentation

See [here](https://sendgridjp.github.io/kintone-sendgrid-plugin/) in Japanese.

## Usage
1. Make Email templates in SendGrid. You can use substitution tags in the templates.
2. Install this plug-in into your environment.
3. Add this plug-in into kintone apps that you want to send emails.
4. Set general settings in the SendGrid plug-in settings.

### API Keys
1. Create an API key on the SendGrid web portal.
2. Set the API key into the SendGrid plug-in settings.

### Mail settings
1. Enter the From address into the SendGrid plug-in settings.
2. Select the kintone field for the To. The To field should be [Text(single-line)] or the [Link(Type is E-mail address)] field which is prohibited duplicate values for the recipient address.

### Template settings
1. Click the Get a list of Templates button.
2. Select the default template name.

### Substitution tags settings (Optional)
1. Click the Add Substitution tag button.
2. Enter the substitution tag which you want to substitute in the email.
3. Select the kintone field for the substitution tag.

## Requirement
* SendGrid account.
* Kintone account.

## Development
1. Cloning the repository to any folder.
  ```
  $ cd /Path/to/the/folder
  $ git clone https://github.com/SendGridJP/kintone-sendgrid-plugin.git
  ```
2. Resolving dependencies.
  ```
  $ cd kintone-sendgrid-plugin
  $ npm install
  ```
3. Set environment variables for [plugin uploader](https://developer.cybozu.io/hc/ja/articles/360000947326) and [plugin packer](https://developer.cybozu.io/hc/ja/articles/360000910783).
  ```
  # Variables for plugin uploader
  export KINTONE_DOMAIN=XXXXXXXX.cybozu.com
  export KINTONE_USERNAME=%%KINTONE UERNAME%%
  export KINTONE_PASSWORD=%%KINTONE PASSWORD%%
  # Variables for plugin packer
  export KINTONE_PPK=%%PPK FILE%%.ppk
  ```
3. Building a plugin file.
  ```
  $ npm run build

  > kintone-sendgrid-plugin@1.0.0 build /Path/to/the/folder/kintone-sendgrid-plugin
  > kintone-plugin-packer ./sendgrid --ppk $KINTONE_PPK

  Succeeded: /Path/to/the/folder/kintone-sendgrid-plugin/plugin.zip
  ```
4. Uploading the plugin file.
  ```
  $ npm run upload

  > kintone-sendgrid-plugin@1.0.0 upload /Path/to/the/folder/kintone-sendgrid-plugin
  > kintone-plugin-uploader --domain $KINTONE_DOMAIN --username $KINTONE_USERNAME --password $KINTONE_PASSWORD plugin.zip

  Open https://XXXXXXXX.cybozu.com/login?saml=off
  Trying to log in...
  Navigate to https://XXXXXXXX.cybozu.com/k/admin/system/plugin/
  Trying to upload plugin.zip
  plugin.zip をアップロードしました!
  ```

## Licence

[MIT](https://github.com/SendGridJP/kintone-sendgrid-plugin/blob/master/LICENSE.txt)

## Author
Wataru Sato

## Copyright
Kozo Keikaku Engineering Inc.
