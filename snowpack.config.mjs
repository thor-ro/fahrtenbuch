export default {
    "exclude": [
        '**/doc/**', 
        '**/css.html', 
        '**/views/*.html', 
        '**/package.json', 
        '**/snowpack.config.js', 
        '**/package-lock.json'],
    optimize: {
        bundle: true,
        minify: true,
        target: 'es2020',
      },

  };