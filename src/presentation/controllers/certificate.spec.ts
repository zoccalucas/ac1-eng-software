import { CertificateController } from './certificate';
import { MissingParamError, InvalidParamError, ServerError } from '../errors';
import { EmailValidator } from '../protocols';

interface SutTypes {
  sut: CertificateController;
  emailValidatorStub: EmailValidator;
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    public isValid(): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
};

const makeEmailValidatorWithError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    public isValid(): boolean {
      throw new Error();
    }
  }
  return new EmailValidatorStub();
};

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const sut = new CertificateController(emailValidatorStub);
  return {
    sut,
    emailValidatorStub
  };
};

describe('Certificate Controller', () => {
  test('Should return 400 if no certificateId is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        studentId: 'anyId',
        studentEmail: 'invalidEmail@gmail.com',
        activePlan: true
      }
    };

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('certificateId'));
  });

  test('Should return 400 if no studentId is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentEmail: 'anyEmail@gmail.com',
        activePlan: true
      }
    };

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('studentId'));
  });

  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        activePlan: true
      }
    };

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('studentEmail'));
  });

  test('Should return 400 if no activePlan is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        studentEmail: 'anyEmail@gmail.com'
      }
    };

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('activePlan'));
  });

  test('Should return 400 if an invalid studentEmail is provided', async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        studentEmail: 'invalidEmail@gmail.com',
        activePlan: true
      }
    };

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('studentEmail'));
  });

  test('Should call EmailValidator with correct studentEmail', async () => {
    const { sut, emailValidatorStub } = makeSut();
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        studentEmail: 'anyEmail@gmail.com',
        activePlan: true
      }
    };

    sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith('anyEmail@gmail.com');
  });

  // Utiliza Factory makeEmailValidatorWithError que gera uma instância de emailValidatorStub retornando um erro
  test('Should return 500 if EmailValidator throws Factory', async () => {
    const emailValidatorStub = makeEmailValidatorWithError();
    const sut = new CertificateController(emailValidatorStub);
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        studentEmail: 'anyEmail@gmail.com',
        activePlan: true
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  // Utiliza o Jest (jest.spyOn) para criar uma versão mockada da implementação retornando um erro
  test('Should return 500 if EmailValidator throws Jest', async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpRequest = {
      body: {
        certificateId: 'anyId',
        studentId: 'anyId',
        studentEmail: 'anyEmail@gmail.com',
        activePlan: true
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });
});
