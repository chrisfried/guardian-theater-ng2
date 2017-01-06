import { GuardiantheaterPage } from './app.po';

describe('guardiantheater App', function() {
  let page: GuardiantheaterPage;

  beforeEach(() => {
    page = new GuardiantheaterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
