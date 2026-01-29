/**
 * Contact Page Logic
 * Uses Vue 3 Composition API
 */

const { createApp, ref, computed } = Vue;

const ContactApp = {
    delimiters: ['[[', ']]'],
    setup() {
        // State
        const selectedBranch = ref('head_office');

        // Branch Data
        const branches = {
            'head_office': {
                name: 'Bangalore (Head Office)',
                address: '123 Solar Street, Green Tech Park',
                city: 'Bengaluru, Karnataka 560001',
                phone: '+919876543210',
                displayPhone: '+91 98765 43210',
                email: 'bangalore@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:00 AM - 6:30 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9897184288863!2d77.59456231482194!3d12.972442990855268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1645432123456!5m2!1sen!2sin'
            },
            'mumbai': {
                name: 'Mumbai Branch',
                address: '45 Sunshine Tower, Andheri West',
                city: 'Mumbai, Maharashtra 400053',
                phone: '+919822233444',
                displayPhone: '+91 98222 33444',
                email: 'mumbai@ultrarayssolar.com',
                hours: 'Mon - Sat: 10:00 AM - 7:00 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109795055266!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1645432345678!5m2!1sen!2sin'
            },
            'delhi': {
                name: 'Delhi Branch',
                address: '88 Green Park, Hauz Khas',
                city: 'New Delhi, Delhi 110016',
                phone: '+919911122333',
                displayPhone: '+91 99111 22333',
                email: 'delhi@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754723076!3d28.52728034389636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!5e0!3m2!1sen!2sin!4v1645432456789!5m2!1sen!2sin'
            },
            'hyderabad': {
                name: 'Hyderabad Branch',
                address: '22 Tech City, Hitech City',
                city: 'Hyderabad, Telangana 500081',
                phone: '+919988776655',
                displayPhone: '+91 99887 76655',
                email: 'hyderabad@ultrarayssolar.com',
                hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
                mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160407063!2d78.26795856407005!3d17.41215312015886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1645432998877!5m2!1sen!2sin'
            }
        };

        // Computeds
        const currentBranch = computed(() => {
            return branches[selectedBranch.value] || branches['head_office'];
        });

        return {
            selectedBranch,
            branches,
            currentBranch
        };
    }
};

// Mount the app
createApp(ContactApp).mount('#contact-app');
