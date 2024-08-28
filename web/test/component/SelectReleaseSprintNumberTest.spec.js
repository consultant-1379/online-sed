import { mount } from '@vue/test-utils';
import SelectReleaseSprintNumber from '../../src/components/SelectReleaseSprintNumber.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';


describe('SelectReleaseSprintNumber', () => {
  test('renders the component', () => {
    const modelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
    };

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        modelObject,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders the component', () => {
    const modelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
    };

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        modelObject,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {
    const modelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '23.16' }
    };

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        modelObject,
        displayHeadingContext: 'Test'
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.sprints);
    expect(dropDownSelect.props('displaykey')).to.be.equal('sprintVersion');
    expect(dropDownSelect.props('default_option')).to.be.equal('23.16');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });

  test('renders DropDownSelect with correct props', () => {
    const modelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        modelObject,
        displayHeadingContext: 'Test'
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.releases);
    expect(dropDownSelect.props('displaykey')).to.be.equal('releaseNumber');
    expect(dropDownSelect.props('default_option')).to.be.equal('24.1');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
