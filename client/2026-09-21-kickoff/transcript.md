Fictional client, created for an internal DECODE exercise.

# Kickoff call, 21 September 2026, condensed transcript

Attendees. Lumen: Marta Kos (operations director), Dr. Petra Novak (head vet),
Tomislav Jurić (IT, part time). DECODE: Ana Horvat (product manager), Luka Babić
(product designer), Iva Marić (software architect).

Recording: Drive, Lumen / Calls / 2026-09-21-kickoff.mp4 (52 minutes).

---

**Ana:** Thanks for making the time. The plan for today is to hear the problem in
your words, agree what we are building and for whom, and list what we do not know
yet. Marta, can you start with why now?

**Marta:** Reception. Every clinic has one or two people on the phone from seven to
ten every morning, booking and moving appointments. The VetDesk widget was supposed
to fix that. It is slow, it looks like a tax form, and it does not know anything
about the pet. It offers every vet at every clinic. Our owners want the vet they
always see. Half the clinics switched it off.

**Petra:** And it lets people book a vaccination for a cat that had one two weeks
ago, because it cannot see the record.

**Ana:** So the app should know the pet. What does a good first version do?

**Marta:** Book and move appointments, with the right vet, at the right clinic. Tell
me when my dog is due for something. Show me the record so I stop calling to ask
what the vet said. And repeat prescriptions. That one is big for us.

**Petra:** That one is also where I get nervous. A repeat prescription is a medical
decision. Owners of a diabetic cat or an epileptic dog need the medicine every month,
and today they call and a vet signs it off between consultations. I do not want an
app where you tap a button and insulin ships. A vet has to approve every one.

**Marta:** Agreed, but the owner should not have to call. They request, a vet
approves, done.

**Petra:** Then the request has to show the vet the last consultation and the last
dispensed date, or we approve blind.

**Ana:** Noted as a rule, not a feature. Luka?

**Luka:** Who are the owners, roughly? Age, phone habits?

**Marta:** Everyone. Students with a rescue cat. Families. Pensioners with a very old
dog who will call anyway. The families are where the volume is.

**Petra:** And farm clients in Osijek and Celje, but they are a different business and
not this app.

**Luka:** Good, that is a scoping decision. One app for pet owners, not farm clients.

**Marta:** Yes.

**Ana:** Reception side. What do they need?

**Marta:** A page. A list of requests coming in, approve or reject, and if they reject,
why. They will not install anything. A page in a browser on the reception computer.

**Iva:** Tomislav, the thing I most need to understand is VetDesk. Does its API let us
write an appointment, or only read?

**Tomislav:** Honestly I do not know. We read from it for the website opening hours.
I have never tried to write. There is a partner API, there is documentation somewhere,
and there is a support contact I have used twice. I can ask.

**Iva:** This is the question the whole project leans on. If we cannot write, the app
sends a request and reception books it by hand in VetDesk, which halves the value.

**Marta:** Then please find out first.

**Tomislav:** I will have an answer within two weeks. The contract renewal is in
January, which is leverage if we need the API opened.

**Ana:** Logged as the first open question, owner Tomislav, blocks the technical
proposal. Anything else that must be in the first version?

**Marta:** Reminders have to be push notifications and email. Our older owners do not
open apps.

**Petra:** Reminders should come from the record, not from a calendar someone types.
Vaccination due dates are in VetDesk already.

**Ana:** Anything you have decided not to do?

**Marta:** No payments. Not now. People pay at the clinic.

**Petra:** No chat with the vet. We would drown.

**Marta:** Although reception would love to be able to message an owner. "Your
results are in", "bring the vaccination booklet". Today that is a phone call.

**Ana:** We will note that one. It sounds like a later version.

**Marta:** Fine.

**Ana:** Timeline. Eight weeks from today. Prototype that developers can build from,
end of November. You have brand guidelines, no design system, no API documentation.
We build the design foundations as part of this and it goes in scope.

**Marta:** Yes.

**Ana:** Who decides when we disagree?

**Marta:** I do. Petra has a veto on anything clinical.

**Ana:** Then we are aligned. Next steps: we write the alignment document and send it
by Friday. Tomislav chases the VetDesk API. Luka will want two owners and two
receptionists to talk to in week two.

**Marta:** I will find them.
