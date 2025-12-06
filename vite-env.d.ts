declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;
