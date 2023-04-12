declare namespace API {
  type Session = {
    token: {
      access: string;
      refresh: string;
    };
    user: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      jti: string;
      iat: number;
      exp: number;
    };
  };

  type Instructor = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };

  type Building = {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };

  type Subject = {
    id: string;
    code: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
    createdAt: string;
    updatedAt: string;
  };
}
