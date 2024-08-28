import { mount } from '@vue/test-utils';
import SelectProduct from '../../src/components/SelectProduct.vue';
import DropDownSelect from "../../src/components/DropDownSelectEmitOptionIndex.vue";

describe('SelectProduct', () => {
  test('renders with multiple products', async () => {
    const modelObject = {
      products: [
        { name: 'EMM' },
        { name: 'cENM' },
      ],
      selectedProduct: { name: 'ENM' },
    };

    const wrapper = mount(SelectProduct, {
      props: {
        modelObject,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {
    const modelObject = {
      products: [
        { name: 'EMM' },
        { name: 'cENM' },
      ],
      selectedProduct: { name: 'ENM' },
    };

    const wrapper = mount(SelectProduct, {
      props: {
        modelObject,
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.products);
    expect(dropDownSelect.props('displaykey')).to.be.equal('name');
    expect(dropDownSelect.props('default_option')).to.be.equal('ENM');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
