import { useState, useEffect } from 'react';
import './Contact.scss';

const Contact = () => {

    // Déclaration des états pour la soumission du formulaire
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false); 

    // Mise à jour des champs du formulaire
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion de l'envoi du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        try {
            const response = await fetch('http://localhost:5001/send-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', message: '' });
                console.log('Message envoyé avec succès !');
                setShowModal(true); 
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi :', error);
            setStatus('error');
        }
    };

    // Réinitialise le statut après 3 secondes
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => setStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const closeModal = () => {
        setShowModal(false); 
    }
    return (
        <section id='contact'>
            <div className='contact-container'>
                <div className='contact-header'>
                    <div className='contact-header-mobile-landscape'>
                        <div className='contact-picture'>
                            <img src="contact_carré.png" alt="photo de Ben Bridgen avec une guitare" />
                        </div>

                        <div className='contact-titles'>
                            <div className='contact-title'>
                                <h1>contact</h1>
                            </div>
                            <div className='contact-line'></div>
                            <div className='contact-title-description'>
                                <h5>Cliquez ici pour la version anglaise</h5>
                                <img src="english-logo.png" alt="" />
                            </div>
                        </div>

                    </div>
                </div>
                <div className='contact-main'>
                    <div className="contact-content">
                        <div className="contact-form">
                            <form onSubmit={handleSubmit}> 
                                <div>
                                    <label htmlFor="firstName">Prénom</label>
                                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Prénom" required />

                                    <label htmlFor="lastName">Nom</label>
                                    <input type="text" id="lastName" name="lastName"value={formData.lastName} onChange={handleChange} placeholder="Nom" required />
                                </div>

                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

                                    <label htmlFor="message">Votre message</label>
                                    <textarea id="message" name="message" rows="4" placeholder="Votre message..." value={formData.message} onChange={handleChange} required></textarea>
                                </div>

                                <button type="submit">Envoyer</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale */}
            {showModal && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='modal'>
                        <h4> Message envoyé avec succès ! </h4>
                        <button onClick={closeModal}>Fermer</button>
                    </div>
                </div>
            )}
        </section>

    );
};

export default Contact; 