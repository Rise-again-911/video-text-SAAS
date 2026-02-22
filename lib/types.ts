export type Snippet = {start: number; text: string};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
