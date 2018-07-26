import Prism from 'prismjs';

export function configureRustErrors({ gotoPosition, reExecuteWithBacktrace, getChannel }) {
  Prism.languages.rust_errors = { // eslint-disable-line camelcase
    'warning': /^warning:.*$/m,
    'error': {
      pattern: /^error(\[E\d+\])?:.*$/m,
      inside: {
        'error-explanation': /\[E\d+\]/,
        'see-issue': /see issue #\d+/,
      },
    },
    'error-location': /-->.*\n/,
    'backtrace': {
      pattern: /at src\/.*\n/,
      inside: {
        'backtrace-location': /src\/main.rs:(\d+)/,
      },
    },
    'backtrace-enable': /Run with `RUST_BACKTRACE=1` for a backtrace/,
  };

  Prism.hooks.add('wrap', env => {
    if (env.type === 'error-explanation') {
      const errorMatch = /E\d+/.exec(env.content);
      const [errorCode] = errorMatch;
      env.tag = 'a';
      env.attributes.href = `https://doc.rust-lang.org/${getChannel()}/error-index.html#${errorCode}`;
      env.attributes.target = '_blank';
    }
    if (env.type === 'see-issue') {
      const errorMatch = /\d+/.exec(env.content);
      const [errorCode] = errorMatch;
      env.tag = 'a';
      env.attributes.href = `https://github.com/rust-lang/rust/issues/${errorCode}`;
      env.attributes.target = '_blank';
    }
    if (env.type === 'error-location') {
      const errorMatch = /(\d+):(\d+)/.exec(env.content);
      const [_, line, col] = errorMatch;
      env.tag = 'a';
      env.attributes.href = '#';
      env.attributes['data-line'] = line;
      env.attributes['data-col'] = col;
    }
    if (env.type === 'backtrace-enable') {
      env.tag = 'a';
      env.attributes.href = '#';
      env.attributes['data-backtrace-enable'] = 'true';
    }
    if (env.type === 'backtrace-location') {
      const errorMatch = /:(\d+)/.exec(env.content);
      const [_, line] = errorMatch;
      env.tag = 'a';
      env.attributes.href = '#';
      env.attributes['data-line'] = line;
      env.attributes['data-col'] = '1';
    }
  });

  Prism.hooks.add('after-highlight', env => {
    const links = env.element.querySelectorAll('.error-location, .backtrace-location');
    Array.from(links).forEach((link: HTMLAnchorElement) => {
      const { line, col } = link.dataset;
      link.onclick = e => {
        e.preventDefault();
        gotoPosition(line, col);
      };
    });

    const backtraceEnablers = env.element.querySelectorAll('.backtrace-enable');
    Array.from(backtraceEnablers).forEach((link: HTMLAnchorElement) => {
      link.onclick = e => {
        e.preventDefault();
        reExecuteWithBacktrace();
      };
    });
  });
}
