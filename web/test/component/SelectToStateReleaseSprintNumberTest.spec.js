import { mount } from '@vue/test-utils';
import SelectToStateReleaseSprintNumber from '../../src/components/SelectToStateReleaseSprintNumber.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';


describe('SelectReleaseSprintNumber', () => {
  test('renders the component', () => {
    const toModelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.17' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const fromModelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.17' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const wrapper = mount(SelectToStateReleaseSprintNumber, {
      propsData: {
        toModelObject,
        fromModelObject
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders the component', () => {
    const toModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const fromModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const wrapper = mount(SelectToStateReleaseSprintNumber, {
      propsData: {
        toModelObject,
        fromModelObject
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {
    const toModelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.17' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '23.16' }
    };

    const fromModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const wrapper = mount(SelectToStateReleaseSprintNumber, {
      propsData: {
        toModelObject,
        displayHeadingContext: 'Test',
        fromModelObject
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(toModelObject.sprints);
    expect(dropDownSelect.props('displaykey')).to.be.equal('sprintVersion');
    expect(dropDownSelect.props('default_option')).to.be.equal('23.17');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });

  test('renders DropDownSelect with correct props', () => {
    const toModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const fromModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };

    const wrapper = mount(SelectToStateReleaseSprintNumber, {
      propsData: {
        toModelObject,
        displayHeadingContext: 'Test',
        fromModelObject
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(toModelObject.releases);
    expect(dropDownSelect.props('displaykey')).to.be.equal('releaseNumber');
    expect(dropDownSelect.props('default_option')).to.be.equal('24.1');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
