import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORIZED_WHATSAPP_ADMIN_EMAIL,
  isAuthorizedWhatsAppAdmin
} from '../../constants/authConfig';

describe('Controle de Permissões — Automação WhatsApp IGEAD-MT', () => {
  it('deve definir o e-mail oficial autorizado como pablohenrique4311@gmail.com', () => {
    assert.equal(AUTHORIZED_WHATSAPP_ADMIN_EMAIL, 'pablohenrique4311@gmail.com');
  });

  it('deve autorizar o e-mail exato do administrador oficial', () => {
    assert.equal(isAuthorizedWhatsAppAdmin('pablohenrique4311@gmail.com'), true);
  });

  it('deve autorizar mesmo com caracteres em maiúsculas (insensível a caixa)', () => {
    assert.equal(isAuthorizedWhatsAppAdmin('PABLOHENRIQUE4311@GMAIL.COM'), true);
    assert.equal(isAuthorizedWhatsAppAdmin('PabloHenrique4311@Gmail.com'), true);
  });

  it('deve autorizar mesmo com espaços em branco nas extremidades', () => {
    assert.equal(isAuthorizedWhatsAppAdmin('   pablohenrique4311@gmail.com  '), true);
    assert.equal(isAuthorizedWhatsAppAdmin('\tpablohenrique4311@gmail.com\n'), true);
  });

  it('deve aceitar objeto de usuário do Supabase com e-mail autorizado', () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'pablohenrique4311@gmail.com'
    };
    assert.equal(isAuthorizedWhatsAppAdmin(mockUser), true);
  });

  it('deve rejeitar qualquer outro e-mail de membro ou pastor que não seja o autorizado', () => {
    assert.equal(isAuthorizedWhatsAppAdmin('membro@igead.com'), false);
    assert.equal(isAuthorizedWhatsAppAdmin('pastor@igead.com'), false);
    assert.equal(isAuthorizedWhatsAppAdmin('admin@igead.com'), false);
    assert.equal(isAuthorizedWhatsAppAdmin('outro_usuario@gmail.com'), false);
  });

  it('deve rejeitar tentativas de spoofing ou prefixos parciais', () => {
    assert.equal(isAuthorizedWhatsAppAdmin('pablohenrique4311@gmail.com.evil.com'), false);
    assert.equal(isAuthorizedWhatsAppAdmin('not-pablohenrique4311@gmail.com'), false);
    assert.equal(isAuthorizedWhatsAppAdmin('pablohenrique4311@outlook.com'), false);
  });

  it('deve rejeitar valores vazios, nulos ou indefinidos', () => {
    assert.equal(isAuthorizedWhatsAppAdmin(null), false);
    assert.equal(isAuthorizedWhatsAppAdmin(undefined), false);
    assert.equal(isAuthorizedWhatsAppAdmin(''), false);
    assert.equal(isAuthorizedWhatsAppAdmin('   '), false);
    assert.equal(isAuthorizedWhatsAppAdmin({ email: null }), false);
    assert.equal(isAuthorizedWhatsAppAdmin({ email: undefined }), false);
    assert.equal(isAuthorizedWhatsAppAdmin({ email: '' }), false);
  });
});
